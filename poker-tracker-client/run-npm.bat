@echo off

IF "%1"=="dev" (
  echo Starting development server on port 3000...
  "C:\Program Files\nodejs\npm.cmd" run dev
  GOTO :EOF
)

IF "%1"=="build" (
  echo Building project...
  "C:\Program Files\nodejs\npm.cmd" run build
  GOTO :EOF
)

IF "%1"=="preview" (
  echo Starting preview server...
  "C:\Program Files\nodejs\npm.cmd" run preview
  GOTO :EOF
)

IF "%1"=="check-port" (
  echo Checking what process is using port 3000...
  netstat -ano | findstr :3000
  GOTO :EOF
)

IF "%1"=="free-port" (
  echo Attempting to free port 3000...
  FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') DO (
    echo Found process: %%P
    echo Attempting to terminate process...
    taskkill /F /PID %%P
    IF ERRORLEVEL 1 (
      echo Failed to terminate process. You may need to run as administrator.
    ) ELSE (
      echo Successfully terminated process.
    )
  )
  GOTO :EOF
)

echo Running npm command: %*
"C:\Program Files\nodejs\npm.cmd" %*
