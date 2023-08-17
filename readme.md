## Setup

- `npm install -g firebase-tools` - Install the [Firebase CLI](https://firebase.google.com/docs/cli)
- `firebase login` - Authenticate the Firebase CLI
- `firebase use --add` - Add your Firebase Project as a target to `.firebaserc`
- You do not need to `npm install` in the app project directory, but can still add and run custom npm scripts to the app `package.json` if you wish

## Generated Workspace Root Files

- `firebase.firestore.json` - Firebase CLI Configuration for this project
- `.firebaserc` - Default Firebase CLI Deployment Targets Configuration
- `firebase.json` - Intentionally Empty Firebase CLI Configuration (only needed to allow Firebase CLI to run in your workspace)
- `firestore.indexes.json` - Default Firebase Firestore Database Rules
- `functions/package.json` - Default Firebase Functions package
- `functions/index.js` - Default Firebase Functions entry point

## Generate Indexes & Deploy

- Make sure to switch to correct project using `firebase use <project-id>`
- `firebase firestore:indexes > firestore.indexes.json` - Generates a file named firestore.indexes.json containing all the indexes
- `firebase deploy --only firestore:indexes` - Deploys indexes to selected project