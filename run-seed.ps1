Set-Location 'c:\Users\ragha\project\get-me-a-chai'
$result = & node scripts/seed.js 2>&1
$result | Out-File 'seed-isolated.log' -Encoding UTF8
Write-Host "Seed done. Exit: $LASTEXITCODE"
