Add-Type -AssemblyName System.Drawing

function Generate-Icon([int]$size, [string]$outPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Dark rounded squircle background
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 12, 18, 34),
        [System.Drawing.Color]::FromArgb(255, 76, 29, 149),
        [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
    )
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $radius = [int]($size * 0.22)
    $diam = $radius * 2
    $path.AddArc(0, 0, $diam, $diam, 180, 90)
    $path.AddArc($size - $diam, 0, $diam, $diam, 270, 90)
    $path.AddArc($size - $diam, $size - $diam, $diam, $diam, 0, 90)
    $path.AddArc(0, $size - $diam, $diam, $diam, 90, 90)
    $path.CloseFigure()
    $g.FillPath($bgBrush, $path)

    # Glowing outer border
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 168, 85, 247), [Math]::Max(1.5, $size * 0.04))
    $g.DrawPath($borderPen, $path)

    # Book Geometry
    $cx = [float]($size / 2.0)
    $bw = [float]($size * 0.26)
    $bh = [float]($size * 0.38)
    $ty = [float]($size * 0.32)
    $by = [float]($ty + $bh)

    # Left Page Points
    [System.Drawing.PointF[]]$ptsLeft = @(
        [System.Drawing.PointF]::new($cx, $by),
        [System.Drawing.PointF]::new($cx - $bw, $by - 8),
        [System.Drawing.PointF]::new($cx - $bw, $ty - 8),
        [System.Drawing.PointF]::new($cx, $ty + 6)
    )
    $leftPage = New-Object System.Drawing.Drawing2D.GraphicsPath
    $leftPage.AddLines($ptsLeft)
    $leftPage.CloseFigure()

    $pageBrush1 = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 245, 158, 11),
        [System.Drawing.Color]::FromArgb(255, 254, 240, 138),
        [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal
    )
    $g.FillPath($pageBrush1, $leftPage)

    # Right Page Points
    [System.Drawing.PointF[]]$ptsRight = @(
        [System.Drawing.PointF]::new($cx, $by),
        [System.Drawing.PointF]::new($cx + $bw, $by - 8),
        [System.Drawing.PointF]::new($cx + $bw, $ty - 8),
        [System.Drawing.PointF]::new($cx, $ty + 6)
    )
    $rightPage = New-Object System.Drawing.Drawing2D.GraphicsPath
    $rightPage.AddLines($ptsRight)
    $rightPage.CloseFigure()

    $pageBrush2 = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 254, 240, 138),
        [System.Drawing.Color]::FromArgb(255, 245, 158, 11),
        [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal
    )
    $g.FillPath($pageBrush2, $rightPage)

    # Book Center Spine
    $spinePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 120, 53, 15), [Math]::Max(1.0, $size * 0.02))
    $g.DrawLine($spinePen, $cx, ($ty + 6), $cx, $by)

    # Glowing Celestial Core
    $starSize = [float]($size * 0.12)
    $starY = [float]($ty - 10)
    $starBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $g.FillEllipse($starBrush, ($cx - $starSize/2), ($starY - $starSize/2), $starSize, $starSize)

    $starGlowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 253, 224, 71), [Math]::Max(1.5, $size * 0.025))
    $g.DrawLine($starGlowPen, $cx, ($starY - $starSize), $cx, ($starY + $starSize))
    $g.DrawLine($starGlowPen, ($cx - $starSize), $starY, ($cx + $starSize), $starY)

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated $outPath ($size x $size)"
}

$base = "D:\NovelPlatform\apps\mobile\android\app\src\main\res"
Generate-Icon 48 "$base\mipmap-mdpi\ic_launcher.png"
Generate-Icon 72 "$base\mipmap-hdpi\ic_launcher.png"
Generate-Icon 96 "$base\mipmap-xhdpi\ic_launcher.png"
Generate-Icon 144 "$base\mipmap-xxhdpi\ic_launcher.png"
Generate-Icon 192 "$base\mipmap-xxxhdpi\ic_launcher.png"
