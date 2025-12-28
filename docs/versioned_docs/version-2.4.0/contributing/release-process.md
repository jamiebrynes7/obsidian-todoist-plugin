# Release Process

This is a brief guide on how to release a new version of the plugin.

1. Update changelog with release version + date.
2. If minor or major release, cut a new version of the docs with `npm run bump-version -- ${VERSION}` in the `docs` directory.
3. Update the versions in:
    1. `manifest.json`
    2. `package.json`
    3. `versions.json`
4. Open a PR + merge
5. Tag the release with `git tag -a ${VERSION}` and push the tag with `git push origin ${VERSION}`
6. Wait for the release build to complete.
7. Update the generated release with the changelog and publish.
8. Test the update in Obsidian.

Note that between steps 4 and 6, there is a period of time where the plugin's `manifest.json` specified version does not have a release associated with it. This only lasts a minute or two, so the impact should be minimal.
