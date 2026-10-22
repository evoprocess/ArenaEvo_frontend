$ErrorActionPreference = 'Stop'

$chromeCandidates = @(
  'C:\Program Files\Google\Chrome\Application\chrome.exe',
  'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'
)
$chrome = $chromeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $chrome) {
  throw 'Google Chrome não encontrado. Instale-o ou ajuste o caminho em docs/gerar-pdfs.ps1.'
}

$sourcePath = Join-Path $PSScriptRoot 'fontes\MAEXT-GERAL-ARENAEVO.html'
$outputPath = Join-Path $PSScriptRoot 'MAEXT-GERAL-ARENAEVO.pdf'
$profileDirectory = Join-Path ([IO.Path]::GetTempPath()) 'arenaevo-manual-externo-pdf-profile'
if (-not (Test-Path -LiteralPath $sourcePath)) { throw "Fonte não encontrada: $sourcePath" }

$sourceUrl = 'file:///' + ($sourcePath -replace '\\', '/')
$process = Start-Process -FilePath $chrome -ArgumentList @(
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--allow-file-access-from-files',
  '--no-pdf-header-footer',
  "--user-data-dir=$profileDirectory",
  "--print-to-pdf=$outputPath",
  $sourceUrl
) -WindowStyle Hidden -Wait -PassThru

if ($process.ExitCode -ne 0 -or -not (Test-Path -LiteralPath $outputPath)) {
  throw "Falha ao gerar MAEXT-GERAL-ARENAEVO.pdf. Código: $($process.ExitCode)."
}
Write-Host "Gerado: $outputPath"
