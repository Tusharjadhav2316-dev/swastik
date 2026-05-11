$modelsUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
$targetDir = "C:\Users\vishal\OneDrive\Desktop\my-project\swastik\public\models"

if (!(Test-Path -Path $targetDir)) {
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
}

$files = @(
    "ssd_mobilenetv1_model-weights_manifest.json",
    "ssd_mobilenetv1_model-shard1",
    "ssd_mobilenetv1_model-shard2",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2"
)

foreach ($file in $files) {
    $url = "$modelsUrl/$file"
    $dest = "$targetDir\$file"
    Write-Host "Downloading $file..."
    Invoke-WebRequest -Uri $url -OutFile $dest
}

Write-Host "All models downloaded successfully."
