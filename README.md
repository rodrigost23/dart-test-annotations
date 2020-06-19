# Dart Test annotations

Annotates files on GitHub based on Dart test results

## Example usage

```yaml
steps:
  - name: Run tests
    run: pub run test --file-reporter="json:test-report.json"
    continue-on-error: true
  - name: Annotate files with test errors
    uses: rodrigost23/dart-test-annotations
    with:
      path: test-report.json
```
