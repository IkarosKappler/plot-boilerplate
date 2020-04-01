#!/bin/bash


echo "Copying screenshots ... "
cp -R ../screenshots/ .

# ::: This is not in use.
# ::: Instead of jsdoc-to-markdown use the overridden jsdoc-template.
# echo "Generating markdown docs from sources ..."
# ./renderjsdoc.sh

./generate-demo-page.sh

# Use thie docs build script instead
(cd .. && ./run-mkdocs.sh)

echo "Building markdown page from template and readme ..."
echo '---' > index.md
echo 'layout: home' >> index.md
echo 'date: 2019-03-11' >> index.md
echo '---' >> index.md
cat ../README.md >> index.md
echo '## Changelog' >> index.md
echo '[View changelog](changelog.html "View changelog")' >> index.md

echo "Building the changelog file ..."
echo '---' > changelog.md
echo 'layout: page' >> changelog.md
echo 'title: Changelog' >> changelog.md
echo '---' >> changelog.md
cat ../changelog.md >> changelog.md

if [ -f "_tracker.js" ]; then
    echo "[Dev] Clearing tracking code if exists ..."
    echo "/* No tracking code */" > _includes/_tracker.js
fi


# Checking link to local repo ...
# ./run-createlinks.sh


echo "Starting jekyll ..."
bundle exec jekyll serve


# Do not start with 'serve' if you want to compile for production!
# bundle exec jekyll build
