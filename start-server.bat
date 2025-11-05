@echo off
echo Starting web server on http://localhost:8000
echo.
echo Opening browser...
start http://localhost:8000
echo.
echo Server is running. Press Ctrl+C to stop.
echo.
powershell -NoProfile -Command "$listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:8000/'); $listener.Start(); Write-Host 'Server started at http://localhost:8000/'; try { while ($listener.IsListening) { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $filePath = if ($request.Url.LocalPath -eq '/') { 'index.html' } else { $request.Url.LocalPath.TrimStart('/') }; if (Test-Path $filePath) { $content = [System.IO.File]::ReadAllBytes($filePath); $response.ContentType = if ($filePath -like '*.html') { 'text/html' } elseif ($filePath -like '*.js') { 'application/javascript' } elseif ($filePath -like '*.css') { 'text/css' } else { 'application/octet-stream' }; $response.ContentLength64 = $content.Length; $response.OutputStream.Write($content, 0, $content.Length); } else { $response.StatusCode = 404; $notFound = [System.Text.Encoding]::UTF8.GetBytes('404 - Not Found'); $response.OutputStream.Write($notFound, 0, $notFound.Length); }; $response.Close(); } } finally { $listener.Stop(); }"
