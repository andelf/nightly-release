<p align="center">
  <a href="https://github.com/andelf/nightly-release/actions"><img alt="andelf/nightly-release status" src="https://github.com/andelf/nightly-release/workflows/build-test/badge.svg"></a>
</p>

# andelf/nightly-release

This action is use to update a nightly release.

Change tag to newest.
Remove old assets, and upload new ones.

## Usage

```yaml
      - name: Update Nightly Release
        uses: andelf/nightly-release@main
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: nightly
          name: 'Desktop App Nightly Relase $$'
          draft: false
          prerelease: true
          body: 'TODO: Add nightly release notes'
          files: |
            ./VERSION
            ./SHA256SUMS.txt
            ./*.zip
            ./*.dmg
            ./*.exe
            ./*.AppImage
```
