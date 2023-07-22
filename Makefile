key:
	cp .env.example .env
reset:
	rm -rf node_modules
	rm package-lock.json
	npm cache clear --force
	npm cache clean --force
	npm i
dev:
	npm run dev
build:
	npm run build
watch:
	npm run watch
lint:
	watch 'npm run lint'
format:
	npm run format
update:
	 npx -p npm-check-updates  -c "ncu -u"
	@make package-clear-legacy
package-clear-legacy:
	npm install --legacy-peer-deps
	npm audit fix --force

