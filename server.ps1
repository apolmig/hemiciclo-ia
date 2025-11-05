$port = 8000
$url = "http://localhost:$port/"

Write-Host "Starting web server at $url" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Open browser
Start-Process $url

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
$listener.Start()

Write-Host "Server is running. Waiting for requests..." -ForegroundColor Green
Write-Host ""

try {
    while ($listener.IsListening) {
        # Wait for a request
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Get the requested file path
        $localPath = $request.Url.LocalPath
        if ($localPath -eq '/') {
            $localPath = '/index.html'
        }

        $filePath = Join-Path $PSScriptRoot $localPath.TrimStart('/')

        Write-Host "Request: $($request.HttpMethod) $localPath" -ForegroundColor Cyan

        if (Test-Path $filePath) {
            # Read file content
            $content = [System.IO.File]::ReadAllBytes($filePath)

            # Set content type based on file extension
            $extension = [System.IO.Path]::GetExtension($filePath)
            $contentType = switch ($extension) {
                '.html' { 'text/html; charset=utf-8' }
                '.js'   { 'application/javascript; charset=utf-8' }
                '.css'  { 'text/css; charset=utf-8' }
                '.json' { 'application/json; charset=utf-8' }
                '.png'  { 'image/png' }
                '.jpg'  { 'image/jpeg' }
                '.jpeg' { 'image/jpeg' }
                '.gif'  { 'image/gif' }
                '.svg'  { 'image/svg+xml' }
                default { 'application/octet-stream' }
            }

            $response.ContentType = $contentType
            $response.ContentLength64 = $content.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($content, 0, $content.Length)

            Write-Host "  -> 200 OK ($($content.Length) bytes)" -ForegroundColor Green
        }
        else {
            # File not found
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found: $localPath")
            $response.OutputStream.Write($notFound, 0, $notFound.Length)

            Write-Host "  -> 404 Not Found" -ForegroundColor Red
        }

        $response.Close()
    }
}
finally {
    $listener.Stop()
    Write-Host ""
    Write-Host "Server stopped." -ForegroundColor Yellow
}
