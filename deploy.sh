die() { echo "$@" 1>&2 ; exit 1; }

git diff --exit-code >/dev/null || die "There are unstaged changes, abort"
git diff --cached --exit-code >/dev/null || die "There are uncommited changes, abort"

echo "o Run test cases"
cd test && ./test-happypath.sh >/dev/null && cd .. || die "Test failures"

echo "o Generate single index file"
cd frontend \
  && ../scripts/inline-resources.sh index-dev.html >index.html \
  && cd .. || die "Generate single index file failed"

git status |grep "frontend/index.html" >/dev/null  && git add "frontend/index.html" >/dev/null
git diff --exit-code >/dev/null || die add "frontend/index.html" >/dev/null \
  && git commit -m"Update auto-generated index file" >/dev/null

git diff --exit-code >/dev/null || die "There are unstaged changes, abort"

echo "o Reading tags"
l=$(git describe --tags)
m=$(git describe --tags --abbrev=0)
[ "$l" == "$m" ] && die "HEAD is already tagged $m"
m=${m:1}
n=$((m + 1))
echo "o Tagging release v$n"
git tag "v$n"

echo "o Start deployment... "
git push origin master >/dev/null
