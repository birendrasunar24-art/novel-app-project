@echo off
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "SDK_ROOT=D:\NovelPlatform\android_sdk"
echo Installing Android Platform 36 and Build Tools...
echo y| "%SDK_ROOT%\cmdline-tools\latest\bin\sdkmanager.bat" --sdk_root="%SDK_ROOT%" "platforms;android-36" "build-tools;36.0.0" "build-tools;28.0.3"
echo Accepting all licenses...
(echo y & echo y & echo y & echo y & echo y & echo y & echo y & echo y & echo y & echo y) | "%SDK_ROOT%\cmdline-tools\latest\bin\sdkmanager.bat" --sdk_root="%SDK_ROOT%" --licenses
echo Done.
