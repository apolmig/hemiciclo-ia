# Download MEP data from European Parliament
$groups = @(
    @{ref='7018'; name='EPP'},
    @{ref='7038'; name='SD'},
    @{ref='7035'; name='Renew'},
    @{ref='7037'; name='ECR'},
    @{ref='7028'; name='Greens'},
    @{ref='7036'; name='Left'},
    @{ref='7150'; name='Patriots'},
    @{ref='7151'; name='ESN'},
    @{ref='6561'; name='NI'}
)

# Create data directory
$dataDir = Join-Path $PSScriptRoot "data"
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir | Out-Null
}

Write-Host "Downloading MEP data from European Parliament..." -ForegroundColor Green
Write-Host ""

foreach ($group in $groups) {
    $url = "https://www.europarl.europa.eu/meps/en/download/advanced/xml?euPoliticalGroupBodyRefNum=$($group.ref)&countryCode=&bodyType=ALL"
    $outputFile = Join-Path $dataDir "$($group.ref).xml"

    Write-Host "Downloading $($group.name) (ref: $($group.ref))..." -NoNewline

    try {
        Invoke-WebRequest -Uri $url -OutFile $outputFile -UseBasicParsing
        $fileSize = (Get-Item $outputFile).Length
        Write-Host " OK ($([math]::Round($fileSize/1024, 2)) KB)" -ForegroundColor Green
    }
    catch {
        Write-Host " FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Download complete! Files saved to: $dataDir" -ForegroundColor Green
