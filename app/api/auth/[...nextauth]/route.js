// app/api/auth/[...nextauth]/route.js
import NextAuthModule from 'next-auth';
import GithubProviderModule from 'next-auth/providers/github';
import CredentialsProviderModule from 'next-auth/providers/credentials';
import connectDb from '@/db/connectDb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Extract the default exports (needed for Next.js 15 + NextAuth v4 compatibility)
const NextAuth = NextAuthModule.default || NextAuthModule;
const GithubProvider = GithubProviderModule.default || GithubProviderModule;
const CredentialsProvider = CredentialsProviderModule.default || CredentialsProviderModule;

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // OAuth authentication providers
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    }),

    // Credentials provider for email/password login
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await connectDb();

          if (!credentials?.email || !credentials?.password) {
            // Expected validation error - no need to log
            return null;
          }

          // Find user
          const user = await User.findOne({ email: credentials.email });
          if (!user || !user.password) {
            // Expected auth failure - user doesn't exist or no password set
            return null;
          }

          // Check password
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            // Expected auth failure - wrong password
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
            role: user.role
          };
        } catch (error) {
          // Only log unexpected errors (database errors, bcrypt errors, etc.)
          console.error('Unexpected auth error:', error);
          return null;
        }
      }
    })
  ],

  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        try {
          await connectDb();

          // Check if user exists
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Create new user
            let username = user.email.split("@")[0].toLowerCase();

            // Make username unique
            let usernameExists = await User.findOne({ username });
            let counter = 1;
            while (usernameExists) {
              username = `${user.email.split("@")[0].toLowerCase()}${counter}`;
              usernameExists = await User.findOne({ username });
              counter++;
            }

            await User.create({
              email: user.email,
              name: user.name || username,
              username: username,
              profilepic: user.image || "/images/default-profilepic.jpg"
            });
          }
        } catch (error) {
          console.error('Error in GitHub signIn callback:', error);
          // Allow sign-in to continue even if user creation fails
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // Fetch latest user data and ensure we have the correct MongoDB _id
      if (token.email) {
        try {
          await connectDb();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString(); // Always use MongoDB _id
            token.username = dbUser.username;
            token.role = dbUser.role;
            token.verified = dbUser.verified;
          }
        } catch (error) {
          console.error('Error fetching user in JWT callback:', error);
          // Continue with existing token data if DB fetch fails
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.username;
        session.user.role = token.role;
        session.user.verified = token.verified;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };