$urls = @(
    "https://downtownmoving.ca/assets/hero-video.mp4",
    "https://downtownmoving.ca/assets/services-video.mp4",
    "https://downtownmoving.ca/assets/work-action-1.mp4",
    "https://downtownmoving.ca/assets/work-action-2.mp4",
    "https://downtownmoving.ca/assets/hero_bg.png"
)

$assetsDir = "C:\Users\missy\.gemini\antigravity\scratch\downtown-moving-updated\assets"
if (!(Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir -Force
}

foreach ($url in $urls) {
    $filename = Split-Path $url -Leaf
    $dest = Join-Path $assetsDir $filename
    Write-Host "Downloading $url to $dest..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -TimeoutSec 60
        Write-Host "Downloaded successfully: $filename"
    } catch {
        Write-Host "Error downloading $url : $_"
    }
}
