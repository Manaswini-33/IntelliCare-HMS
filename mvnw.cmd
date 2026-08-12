@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------

@if "%DEBUG%" == "" @echo off
@setlocal

set MAVEN_CMD_LINE_ARGS=%*
set MAVEN_OPTS=-Dmaven.resolver.transport=wagon -Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true

if exist "%~dp0\.mvn\wrapper\maven-wrapper.properties" (
    call "C:\Program Files\JetBrains\IntelliJ IDEA 2025.3\plugins\maven\lib\maven3\bin\mvn.cmd" %MAVEN_CMD_LINE_ARGS%
) else (
    call "C:\Program Files\JetBrains\IntelliJ IDEA 2025.3\plugins\maven\lib\maven3\bin\mvn.cmd" %MAVEN_CMD_LINE_ARGS%
)
