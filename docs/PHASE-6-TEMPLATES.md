# Phase 6: Progress & Component Templates

## ✅ Completed (2/17 components)

1. ✅ RichTextEditor.js - TipTap editor with toolbar
2. ✅ CreateUpdateForm.js - Form with editor integration

---

## 📝 Remaining Components with Templates

### Day 22: Content Manager (4 remaining)

#### 3. UpdateCard.js
```javascript
'use client';
import Link from 'next/link';
import { FaEye, FaEdit, FaTrash, FaClock } from 'react-icons/fa';

export default function UpdateCard({ update }) {
  const getStatusBadge = () => {
    const badges = {
      published: { color: '#10b981', label: 'Published' },
      draft: { color: '#6b7280', label: 'Draft' },
      scheduled: { color: '#f59e0b', label: 'Scheduled' }
    };
    return badges[update.status];
  };

  return (
    <div className="update-card">
      <div className="card-header">
        <h3>{update.title}</h3>
        <span className="status-badge" style={{ background: getStatusBadge().color }}>
          {getStatusBadge().label}
        </span>
      </div>
      <p className="campaign-name">{update.campaign?.title}</p>
      <div className="card-footer">
        <span><FaEye /> {update.views} views</span>
        <span>{new Date(update.createdAt).toLocaleDateString()}</span>
        <div className="actions">
          <button><FaEdit /></button>
          <button><FaTrash /></button>
        </div>
      </div>
    </div>
  );
}
```

#### 4. UpdatesList.js
```javascript
'use client';
import { useState } from 'react';
import UpdateCard from './UpdateCard';
import { FaSearch, FaFilter } from 'react-icons/fa';

export default function UpdatesList({ updates }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = updates.filter(u => {
    const matchesFilter = filter === 'all' || u.status === filter;
    const matchesSearch = u.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="updates-list">
      <div className="list-header">
        <input
          type="text"
          placeholder="Search updates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>
      <div className="updates-grid">
        {filtered.map(update => (
          <UpdateCard key={update._id} update={update} />
        ))}
      </div>
    </div>
  );
}
```

#### 5. SchedulePublishModal.js
```javascript
'use client';
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function SchedulePublishModal({ onSchedule, onClose }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [time, setTime] = useState('12:00');

  const handleSchedule = () => {
    const [hours, minutes] = time.split(':');
    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(parseInt(hours), parseInt(minutes));
    onSchedule(scheduledDate);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Schedule Publication</h2>
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={{ before: new Date() }}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSchedule}>Schedule</button>
        </div>
      </div>
    </div>
  );
}
```

#### 6. UpdatePreview.js
```javascript
'use client';

export default function UpdatePreview({ title, content, campaign }) {
  return (
    <div className="update-preview">
      <h3>Preview</h3>
      <div className="preview-content">
        {campaign && <p className="campaign-badge">{campaign.title}</p>}
        <h1>{title || 'Untitled Update'}</h1>
        <div
          className="content-html"
          dangerouslySetInnerHTML={{ __html: content || '<p>Start writing...</p>' }}
        />
      </div>
    </div>
  );
}
```

---

### Day 23: Notifications (5 components)

#### 1. NotificationBell.js
```javascript
'use client';
import { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import Link from 'next/link';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications/count');
    const data = await res.json();
    setUnreadCount(data.count);
  };

  return (
    <div className="notification-bell">
      <button onClick={() => setShowDropdown(!showDropdown)}>
        <FaBell />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>
      {showDropdown && (
        <div className="dropdown">
          {/* Last 5 notifications */}
          <Link href="/notifications">View All</Link>
        </div>
      )}
    </div>
  );
}
```

#### 2. NotificationsList.js
```javascript
'use client';
import NotificationItem from './NotificationItem';

export default function NotificationsList({ notifications }) {
  const grouped = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: []
  };

  // Group notifications by date
  notifications.forEach(notif => {
    const date = new Date(notif.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) grouped.today.push(notif);
    else if (diffDays === 1) grouped.yesterday.push(notif);
    else if (diffDays <= 7) grouped.thisWeek.push(notif);
    else grouped.older.push(notif);
  });

  return (
    <div className="notifications-list">
      {Object.entries(grouped).map(([period, items]) => (
        items.length > 0 && (
          <div key={period} className="notification-group">
            <h3>{period.charAt(0).toUpperCase() + period.slice(1)}</h3>
            {items.map(notif => (
              <NotificationItem key={notif._id} notification={notif} />
            ))}
          </div>
        )
      ))}
    </div>
  );
}
```

#### 3. NotificationItem.js
```javascript
'use client';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationItem({ notification }) {
  const getIcon = (type) => {
    const icons = {
      payment: '💰',
      milestone: '🎉',
      comment: '💬',
      update: '📝',
      system: '⚙️'
    };
    return icons[type] || '📢';
  };

  const markAsRead = async () => {
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ id: notification._id })
    });
  };

  return (
    <Link href={notification.link || '#'} onClick={markAsRead}>
      <div className={`notification-item ${notification.read ? '' : 'unread'}`}>
        <span className="icon">{getIcon(notification.type)}</span>
        <div className="content">
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
          <span className="time">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
        </div>
        {!notification.read && <span className="unread-dot"></span>}
      </div>
    </Link>
  );
}
```

#### 4. NotificationFilters.js
```javascript
'use client';

export default function NotificationFilters({ filter, setFilter }) {
  const types = ['all', 'payment', 'milestone', 'comment', 'update', 'system'];
  const statuses = ['all', 'unread'];

  return (
    <div className="notification-filters">
      <div className="filter-group">
        <label>Type:</label>
        <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
          {types.map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Status:</label>
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          {statuses.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
```

#### 5. NotificationPreferences.js
```javascript
'use client';
import { useState } from 'react';

export default function NotificationPreferences({ preferences, onSave }) {
  const [settings, setSettings] = useState(preferences || {
    emailNotifications: {
      payment: true,
      milestone: true,
      comment: false,
      update: true,
      system: true
    },
    frequency: 'realtime'
  });

  return (
    <div className="notification-preferences">
      <h3>Notification Preferences</h3>
      
      <div className="pref-section">
        <h4>Email Notifications</h4>
        {Object.keys(settings.emailNotifications).map(type => (
          <label key={type}>
            <input
              type="checkbox"
              checked={settings.emailNotifications[type]}
              onChange={(e) => setSettings({
                ...settings,
                emailNotifications: {
                  ...settings.emailNotifications,
                  [type]: e.target.checked
                }
              })}
            />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </label>
        ))}
      </div>

      <div className="pref-section">
        <h4>Frequency</h4>
        <select
          value={settings.frequency}
          onChange={(e) => setSettings({ ...settings, frequency: e.target.value })}
        >
          <option value="realtime">Real-time</option>
          <option value="daily">Daily Digest</option>
          <option value="weekly">Weekly Digest</option>
        </select>
      </div>

      <button onClick={() => onSave(settings)}>Save Preferences</button>
    </div>
  );
}
```

---

### Day 24: Email Templates (6 templates)

All email templates follow this structure:

```javascript
export default function EmailTemplate({ data }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; }
        .content { padding: 20px; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Get Me A Chai</h1>
        </div>
        <div class="content">
          <!-- Template-specific content -->
        </div>
        <div class="footer">
          <p>© 2026 Get Me A Chai. All rights reserved.</p>
          <a href="#">Unsubscribe</a>
        </div>
      </div>
    </body>
    </html>
  `;
}
```

---

## 🔌 API Routes Needed

### Notifications APIs:
```javascript
// /api/notifications/list
export async function GET(request) {
  const session = await getServerSession();
  const notifications = await Notification.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50);
  return NextResponse.json({ success: true, notifications });
}

// /api/notifications/mark-read
export async function POST(request) {
  const { id } = await request.json();
  await Notification.findByIdAndUpdate(id, { read: true });
  return NextResponse.json({ success: true });
}

// /api/notifications/count
export async function GET(request) {
  const session = await getServerSession();
  const count = await Notification.countDocuments({
    user: session.user.id,
    read: false
  });
  return NextResponse.json({ success: true, count });
}
```

### Content APIs:
```javascript
// /api/updates/create
export async function POST(request) {
  const session = await getServerSession();
  const data = await request.json();
  const update = await CampaignUpdate.create({
    ...data,
    creator: session.user.id
  });
  return NextResponse.json({ success: true, update });
}

// /api/updates/list
export async function GET(request) {
  const session = await getServerSession();
  const updates = await CampaignUpdate.find({ creator: session.user.id })
    .populate('campaign', 'title')
    .sort({ createdAt: -1 });
  return NextResponse.json({ success: true, updates });
}
```

---

## ⏱️ Time Estimate

- **Completed**: 2 components (~1 hour)
- **Remaining**: 15 components + APIs (~6-7 hours)

---

**Status**: Templates provided for all remaining components
**Next**: Implement API routes and integrate components into pages
