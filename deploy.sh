rm -rf site

yarn build

cd site
git init
git remote add origin git@github.com:bfdes/bfdes.github.io.git
git add .
git commit --allow-empty-message -m ""
git push --force origin master:gh-pages

