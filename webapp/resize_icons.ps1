Add-Type -AssemblyName System.Drawing

$srcPath = 'e:\NVHTTN\landing-page-ky-nang-he\assets\logo-nvh.png'
$out192   = 'e:\NVHTTN\landing-page-ky-nang-he\webapp\icon-192.png'
$out512   = 'e:\NVHTTN\landing-page-ky-nang-he\webapp\icon-512.png'

$img = [System.Drawing.Image]::FromFile($srcPath)

foreach ($size in @(192, 512)) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g   = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $size, $size)
    $outPath = if ($size -eq 192) { $out192 } else { $out512 }
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Saved $outPath"
}

$img.Dispose()
Write-Host "All done"
