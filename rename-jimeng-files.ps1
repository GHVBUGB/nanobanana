# Batch rename jimeng image files script
# Convert filenames containing Chinese characters to safe ASCII filenames

# Import filename processing function
function Sanitize-Filename {
    param([string]$filename)
    
    # Remove file extension
    $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($filename)
    $extension = [System.IO.Path]::GetExtension($filename)
    
    # Extract jimeng prefix and ID
    if ($nameWithoutExt -match '^(jimeng-\d{4}-\d{2}-\d{2}-\d+)-(.*)$') {
        $prefix = $matches[1]
        $description = $matches[2]
        
        # Generate hash of description
        $hash = [System.Security.Cryptography.MD5]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($description))
        $hashString = [System.BitConverter]::ToString($hash).Replace("-", "").Substring(0, 8).ToLower()
        
        # Return sanitized filename
        return "$prefix-$hashString$extension"
    }
    
    # If pattern doesn't match, return original filename
    return $filename
}

# Get public directory path
$publicDir = "C:\Users\guhongji001\Desktop\banana\ai-image-platform\public"

# Get all jimeng image files
$jimengFiles = Get-ChildItem -Path $publicDir -Filter "jimeng*.png"

Write-Host "Found $($jimengFiles.Count) jimeng image files"
Write-Host ""

# Create rename mapping table
$renameMap = @{}

foreach ($file in $jimengFiles) {
    $oldName = $file.Name
    $newName = Sanitize-Filename $oldName
    
    if ($oldName -ne $newName) {
        $renameMap[$oldName] = $newName
        Write-Host "Will rename: $oldName -> $newName"
    } else {
        Write-Host "Skip (already safe filename): $oldName"
    }
}

Write-Host ""
Write-Host "Total files to rename: $($renameMap.Count)"

if ($renameMap.Count -gt 0) {
    $confirm = Read-Host "Continue with renaming? (y/N)"
    
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
        Write-Host ""
        Write-Host "Starting file renaming..."
        
        foreach ($oldName in $renameMap.Keys) {
            $newName = $renameMap[$oldName]
            $oldPath = Join-Path $publicDir $oldName
            $newPath = Join-Path $publicDir $newName
            
            try {
                Rename-Item -Path $oldPath -NewName $newName -ErrorAction Stop
                Write-Host "Success: $oldName -> $newName"
            } catch {
                Write-Host "Failed: $oldName -> $newName (Error: $($_.Exception.Message))"
            }
        }
        
        Write-Host ""
        Write-Host "Renaming completed!"
        
        # Output rename mapping table to JSON file
        $mappingJson = $renameMap | ConvertTo-Json -Depth 2
        $mappingFile = Join-Path $publicDir "jimeng-rename-mapping.json"
        $mappingJson | Out-File -FilePath $mappingFile -Encoding UTF8
        Write-Host "Rename mapping saved to: $mappingFile"
        
    } else {
        Write-Host "Cancelled renaming operation"
    }
} else {
    Write-Host "No files need renaming"
}