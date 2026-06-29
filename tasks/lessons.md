
## 2026-06-28 — cp -r con .git clobbea el repo
**Error:** `cp -r /tmp/nextapp/. repo/` copió `nextapp/.git` ENCIMA del `.git` del repo → HEAD saltó al commit del scaffold, se perdieron refs locales (commits sin pushear) y se pisó CLAUDE.md.
**Causa:** `nextapp/.` incluye la `.git` del proyecto temporal.
**Fix:** objetos sobrevivieron (cp no borra) → `git reset --soft <hash-real>` + re-add remotes + `git checkout -- CLAUDE.md`.
**Regla:** al mover archivos generados con create-next-app (u otro scaffolder que hace `git init`), SIEMPRE `rm -rf src/.git` antes de copiar, o usar `rsync -a --exclude='.git'`. Nunca `cp -r dir/.` si dir tiene `.git`.
