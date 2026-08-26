@echo off
setlocal

REM ============================================================
REM Fetch OpenWakeWord and VAD model assets
REM Windows equivalent of fetch-models.sh
REM ============================================================

REM Go to project root (parent of scripts folder)
cd /d "%~dp0.."

set "OWW_SRC=node_modules\openwakeword-wasm-browser\models"
set "OWW_DST=public\openwakeword\models"

set "VAD_NESTED=node_modules\@ricky0123\vad-react\node_modules\@ricky0123\vad-web\dist"
set "VAD_TOP=node_modules\@ricky0123\vad-web\dist"

set "PUBLIC=public"

REM Create destination directories
if not exist "%OWW_DST%" mkdir "%OWW_DST%"
if not exist "%PUBLIC%" mkdir "%PUBLIC%"

REM ============================================================
REM Check OpenWakeWord source
REM ============================================================

if not exist "%OWW_SRC%" (
    echo fetch-models: run npm install first ^(missing %OWW_SRC%^) 1>&2
    exit /b 1
)

echo Copying OpenWakeWord models from openwakeword-wasm-browser...

copy /Y "%OWW_SRC%\*.onnx" "%OWW_DST%\" >nul

if errorlevel 1 (
    echo Failed to copy OpenWakeWord models.
    exit /b 1
)

REM ============================================================
REM Find VAD source
REM ============================================================

set "VAD_SRC=%VAD_NESTED%"

if not exist "%VAD_SRC%" (
    set "VAD_SRC=%VAD_TOP%"
)

REM ============================================================
REM Copy VAD assets
REM ============================================================

if exist "%VAD_SRC%" (
    echo Copying VAD assets to public/...

    copy /Y "%VAD_SRC%\silero_vad_legacy.onnx" "%PUBLIC%\" >nul
    copy /Y "%VAD_SRC%\vad.worklet.bundle.min.js" "%PUBLIC%\" >nul

    if exist "%VAD_SRC%\silero_vad.onnx" (
        copy /Y "%VAD_SRC%\silero_vad.onnx" "%PUBLIC%\" >nul
    )
) else (
    echo Warning: VAD dist directory not found.
)

echo fetch-models: done.

endlocal
exit /b 0