@echo off
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot"
set "ANDROID_HOME=D:\NovelPlatform\android_sdk"
set "PATH=D:\flutter\bin;%JAVA_HOME%\bin;C:\Users\biren\PortableGit\cmd;%PATH%"
cmd.exe /c "D:\flutter\bin\flutter.bat %*"
