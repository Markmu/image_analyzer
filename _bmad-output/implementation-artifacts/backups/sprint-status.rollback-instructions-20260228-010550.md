# Sprint Status Rollback Instructions

## Purpose
Restore the pre-SP sprint status entries after the current requirement work is complete.

## Backup Source
- `backups/sprint-status.pre-SP-20260228-010550.yaml`

## Rollback Command
```bash
cp _bmad-output/implementation-artifacts/backups/sprint-status.pre-SP-20260228-010550.yaml \
   _bmad-output/implementation-artifacts/sprint-status.yaml
```

## Verification
```bash
ruby -e 'require "yaml"; YAML.load_file("_bmad-output/implementation-artifacts/sprint-status.yaml"); puts "YAML_OK"'
```
