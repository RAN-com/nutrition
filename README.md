## Code Commit

```powershell
git add -A
git commit -m "{COMMIT_MESSAGE}"
git push origin master
```

## Build Steps

#### Follow the below step for application release

### Set Npm Version to track the package

```powershell
npm version {minor | patch | major}
```

### Set Tag ( Optional )

```powershell
git tag {NPM_VERSION} #version of the output of npm version here
```

### Push the Tag

```powershell
git push origin {TAG_VERSION}
```

### Build

For Windows

```powershell
npx electron-builder --win
```

For Mac

```powershell
npx electron-builder --mac
```

For Linux

```powershell
npx electron-builder --linux
```

### Create Release using GH

```powershell
gh release create v0.0.0 './resources/' --title "your title goes here" --notes "add about changes and other things"
```
