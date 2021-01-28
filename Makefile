out := _out
ext := $(out)/ext
pkg := $(out)/$(shell json -d- -a name version < src/manifest.json)
crx := $(pkg).crx
zip := $(pkg).zip

crx: $(crx)
%.crx: %.zip private.pem; crx3-new private.pem < $< > $@

src := $(wildcard src/*)
dest := $(patsubst src/%.jsx, $(ext)/%.js, $(filter %.jsx, $(src))) \
	$(patsubst src/%, $(ext)/%, $(filter-out %.jsx, $(src))) \
	$(ext)/node_modules/dom-chef/index.js

compile: $(dest)

zip: $(zip)
%.zip: $(dest)
	@mkdir -p $(dir $@)
	cd $(dir $<) && zip -qr $(CURDIR)/$@ *

private.pem:
	openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out $@

upload: $(crx)
	scp $< gromnitsky@web.sourceforge.net:/home/user-web/gromnitsky/htdocs/js/chrome/

$(ext)/%.js: src/%.jsx
	$(mkdir)
	node_modules/.bin/babel -s --plugins @babel/transform-react-jsx $< -o $@

$(ext)/node_modules/%: node_modules/%; $(copy)
$(ext)/%: src/%; $(copy)

.DELETE_ON_ERROR:
mkdir = @mkdir -p $(dir $@)
define copy =
$(mkdir)
cp $< $@
endef
