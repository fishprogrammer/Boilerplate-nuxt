$ErrorActionPreference = "Stop"
$src = "g:\79-boilerplate-source\Boilerplate\src"
$dst = "g:\79-boilerplate-source\Boilerplate-nuxt"

function Copy-AndTransform {
    param([string]$From, [string]$To)
    $null = New-Item -ItemType Directory -Force -Path (Split-Path $To)
    Copy-Item -Force $From $To
    $content = [System.IO.File]::ReadAllText($To)
    $content = $content -replace '@/store', '~/stores'
    $content = $content -replace '@/store/users', '~/stores/users'
    $content = $content -replace '@/', '~/'
    Set-Content -Path $To -Value $content -Encoding UTF8 -NoNewline
}

# Copy shared layers
$dirs = @('api', 'utils', 'constants', 'composables', 'components')
foreach ($d in $dirs) {
    $target = Join-Path $dst $d
    if (Test-Path $target) { Remove-Item -Recurse -Force $target }
    Copy-Item -Recurse (Join-Path $src $d) $target
    Get-ChildItem -Recurse $target -Include *.ts,*.vue | ForEach-Object {
        $c = [System.IO.File]::ReadAllText($_.FullName)
        $c = $c -replace '@/store/index', '~/stores/auth'
        $c = $c -replace '@/store/users', '~/stores/users'
        $c = $c -replace '@/store', '~/stores/auth'
        $c = $c -replace '@/', '~/'
    Set-Content -Path $_.FullName -Value $c -Encoding UTF8
    }
}

# Assets
$assetsDst = Join-Path $dst "assets"
if (Test-Path $assetsDst) { Remove-Item -Recurse -Force $assetsDst }
Copy-Item -Recurse (Join-Path $src "assets") $assetsDst
$null = New-Item -ItemType Directory -Force -Path (Join-Path $assetsDst "css")
Copy-Item -Force (Join-Path $src "style.css") (Join-Path $assetsDst "css\style.css")
$stylesDst = Join-Path $assetsDst "css\styles"
$null = New-Item -ItemType Directory -Force -Path $stylesDst
Copy-Item -Force (Join-Path $src "styles\date-picker-theme.css") (Join-Path $stylesDst "date-picker-theme.css")
$css = [System.IO.File]::ReadAllText((Join-Path $assetsDst "css\style.css"))
$css = $css -replace '\./styles/date-picker-theme\.css', './styles/date-picker-theme.css'
Set-Content (Join-Path $assetsDst "css\style.css") $css -Encoding UTF8 -NoNewline

# Config
$configDst = Join-Path $dst "config"
$null = New-Item -ItemType Directory -Force -Path $configDst
Copy-Item -Force (Join-Path $src "config\app.ts") (Join-Path $configDst "app.ts")

# PWA helper
Copy-Item -Force (Join-Path $src "pwa.ts") (Join-Path $dst "utils\pwa-register.ts")

# Scripts
$scriptsSrc = "g:\79-boilerplate-source\Boilerplate\scripts"
if (Test-Path $scriptsSrc) {
    $scriptsDst = Join-Path $dst "scripts"
    $null = New-Item -ItemType Directory -Force -Path $scriptsDst
    Copy-Item -Force (Join-Path $scriptsSrc "generate-pwa-icons.ps1") (Join-Path $scriptsDst "generate-pwa-icons.ps1")
}

# Page mappings: source relative to pages/, dest relative to pages/, route name, layout, flags
$pageMap = @(
    @{ s = "auth\login.vue"; d = "login.vue"; n = "Login"; l = "blank"; g = $true },
    @{ s = "auth\verify.vue"; d = "verify.vue"; n = "Verify"; l = "blank"; g = $true },
    @{ s = "auth\register.vue"; d = "register.vue"; n = "Register"; l = "blank"; g = $true },
    @{ s = "auth\register-verify.vue"; d = "register\verify.vue"; n = "RegisterVerify"; l = "blank"; g = $true },
    @{ s = "blog\view-blog.vue"; d = "blog\p\[id].vue"; n = "view-blog"; l = "blank"; st = $true; t = "مشاهده پست" },
    @{ s = "tickets\guest\create.vue"; d = "tickets\guest\create.vue"; n = "guest-ticket-create"; l = "blank"; st = $true; t = "تیکت مهمان" },
    @{ s = "tickets\guest\track.vue"; d = "tickets\guest\track.vue"; n = "guest-ticket-track"; l = "blank"; st = $true; t = "پیگیری تیکت" },
    @{ s = "tickets\guest\view.vue"; d = "tickets\guest\view.vue"; n = "guest-ticket-view"; l = "blank"; st = $true; t = "تیکت مهمان" },
    @{ s = "..\layout\index.vue"; d = "index.vue"; n = "Index"; l = "dashboard" },
    @{ s = "users\index.vue"; d = "users\index.vue"; n = "users"; l = "dashboard" },
    @{ s = "users\create-user.vue"; d = "users\create.vue"; n = "create-user"; l = "dashboard" },
    @{ s = "users\view-user.vue"; d = "users\[id]\index.vue"; n = "user-view"; l = "dashboard" },
    @{ s = "users\edit-user.vue"; d = "users\[id]\edit.vue"; n = "user-edit"; l = "dashboard" },
    @{ s = "profile.vue"; d = "profile.vue"; n = "Profile"; l = "dashboard" },
    @{ s = "wallet\index.vue"; d = "wallet\index.vue"; n = "wallet"; l = "dashboard" },
    @{ s = "wallet\deposit.vue"; d = "wallet\deposit.vue"; n = "wallet-deposit"; l = "dashboard" },
    @{ s = "wallet\deposit-result.vue"; d = "wallet\deposit\result.vue"; n = "wallet-deposit-result"; l = "dashboard" },
    @{ s = "wallet\manage\index.vue"; d = "wallet\manage\index.vue"; n = "wallet-manage"; l = "dashboard" },
    @{ s = "wallet\manage\view-wallet.vue"; d = "wallet\manage\[id].vue"; n = "view-wallet"; l = "dashboard" },
    @{ s = "payments\admin\settings.vue"; d = "payments\admin\settings.vue"; n = "payment-settings"; l = "dashboard" },
    @{ s = "payments\admin\gateways\index.vue"; d = "payments\admin\gateways\index.vue"; n = "payment-gateways"; l = "dashboard" },
    @{ s = "payments\admin\gateways\form.vue"; d = "payments\admin\gateways\create.vue"; n = "payment-gateway-create"; l = "dashboard" },
    @{ s = "payments\admin\gateways\form.vue"; d = "payments\admin\gateways\[id].vue"; n = "payment-gateway-edit"; l = "dashboard" },
    @{ s = "payments\admin\gateway-orders.vue"; d = "payments\admin\gateways\[id]\orders.vue"; n = "payment-gateway-orders"; l = "dashboard" },
    @{ s = "payments\admin\manual-deposit.vue"; d = "payments\admin\manual-deposit.vue"; n = "payment-manual-deposit"; l = "dashboard" },
    @{ s = "media.vue"; d = "media.vue"; n = "media"; l = "dashboard" },
    @{ s = "notifications\index.vue"; d = "notifications\index.vue"; n = "notifications"; l = "dashboard" },
    @{ s = "notifications\send-notif.vue"; d = "notifications\send.vue"; n = "send-notification"; l = "dashboard" },
    @{ s = "notifications\view-notif.vue"; d = "notifications\view\[id].vue"; n = "view-notification"; l = "dashboard" },
    @{ s = "roles\index.vue"; d = "roles\index.vue"; n = "roles"; l = "dashboard" },
    @{ s = "roles\create-role.vue"; d = "roles\create.vue"; n = "create-role"; l = "dashboard" },
    @{ s = "roles\edit-role.vue"; d = "roles\edit\[id].vue"; n = "edit-role"; l = "dashboard" },
    @{ s = "permissions.vue"; d = "permissions.vue"; n = "permissions"; l = "dashboard" },
    @{ s = "blog\index.vue"; d = "blog\index.vue"; n = "blog"; l = "dashboard" },
    @{ s = "blog\create-blog.vue"; d = "blog\create.vue"; n = "create-blog"; l = "dashboard" },
    @{ s = "blog\comments\index.vue"; d = "blog\comments\index.vue"; n = "blog-comments"; l = "dashboard" },
    @{ s = "blog\comments\view-comment.vue"; d = "blog\comments\view\[id].vue"; n = "view-blog-comment"; l = "dashboard" },
    @{ s = "blog\edit-blog.vue"; d = "blog\[id]\edit.vue"; n = "edit-blog"; l = "dashboard" },
    @{ s = "tickets\index.vue"; d = "tickets\index.vue"; n = "tickets"; l = "dashboard" },
    @{ s = "tickets\create-ticket.vue"; d = "tickets\create.vue"; n = "create-ticket"; l = "dashboard" },
    @{ s = "tickets\view-ticket.vue"; d = "tickets\view\[id].vue"; n = "view-ticket"; l = "dashboard" },
    @{ s = "tickets\queue.vue"; d = "tickets\queue.vue"; n = "ticket-queue"; l = "dashboard" },
    @{ s = "tickets\admin\types.vue"; d = "tickets\admin\types.vue"; n = "ticket-types"; l = "dashboard" },
    @{ s = "tickets\admin\departments.vue"; d = "tickets\admin\departments.vue"; n = "ticket-departments"; l = "dashboard" },
    @{ s = "tickets\admin\settings.vue"; d = "tickets\admin\settings.vue"; n = "ticket-settings"; l = "dashboard" },
    @{ s = "system-settings.vue"; d = "system-settings.vue"; n = "system-settings"; l = "dashboard" },
    @{ s = "system-health.vue"; d = "system-health.vue"; n = "system-health"; l = "dashboard" }
)

$pagesDst = Join-Path $dst "pages"
if (Test-Path $pagesDst) { Remove-Item -Recurse -Force $pagesDst }
$null = New-Item -ItemType Directory -Force -Path $pagesDst

foreach ($m in $pageMap) {
    $from = if ($m.s.StartsWith("..\")) {
        Join-Path $src ($m.s -replace '^\.\.\\', '')
    } else {
        Join-Path $src "pages\$($m.s)"
    }
    $to = Join-Path $pagesDst $m.d
    $null = New-Item -ItemType Directory -Force -Path (Split-Path $to)
    Copy-Item -Force $from $to

    $meta = @()
    $meta += "  name: '$($m.n)'"
    $meta += "  layout: '$($m.l)'"
    if ($m.g) { $meta += "  guest: true" }
    if ($m.st) { $meta += "  standalone: true" }
    if ($m.t) { $meta += "  title: '$($m.t)'" }

    $block = "<script setup lang=`"ts`">`ndefinePageMeta({`n$($meta -join ",`n")`n})`n</script>`n`n"
    $content = [System.IO.File]::ReadAllText($to)
    $content = $content -replace '@/store/index', '~/stores/auth'
    $content = $content -replace '@/store/users', '~/stores/users'
    $content = $content -replace '@/store', '~/stores/auth'
    $content = $content -replace '@/', '~/'
    if ($content -match '<script setup') {
        $content = $content -replace '(<script setup[^>]*>)', "`$1`ndefinePageMeta({`n$($meta -join ",`n")`n})`n"
    } else {
        $content = $block + $content
    }
    [System.IO.File]::WriteAllText($to, $content)
}

# Dashboard layout
$layoutDst = Join-Path $dst "layouts"
$null = New-Item -ItemType Directory -Force -Path $layoutDst
Copy-Item -Force (Join-Path $src "layout\DashboardLayout.vue") (Join-Path $layoutDst "dashboard.vue")
$dl = [System.IO.File]::ReadAllText((Join-Path $layoutDst "dashboard.vue"))
$dl = $dl -replace '<router-view\s*/>', '<slot />'
$dl = $dl -replace '@/store/index', '~/stores/auth'
$dl = $dl -replace '@/store/users', '~/stores/users'
$dl = $dl -replace '@/store', '~/stores/auth'
$dl = $dl -replace '@/', '~/'
Set-Content (Join-Path $layoutDst "dashboard.vue") $dl -Encoding UTF8 -NoNewline

Write-Host "Migration copy complete."
