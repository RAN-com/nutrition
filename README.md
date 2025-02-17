## Generate PAT

set env GH_TOKEN in your system

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
npm run build:win
```

For Mac

```powershell
npm run build:mac
```

For Linux

```powershell
npm run build:linux
```

### Create Release using GH

```powershell
gh release create v0.0.0 'FILE_PATH' --title "TITLE" --notes "___"
```
