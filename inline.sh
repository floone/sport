cd frontend \
  && ../scripts/inline-resources.sh index-dev.html |grep -v "console.log('" >index.html \
  && cd .. || exit 1
