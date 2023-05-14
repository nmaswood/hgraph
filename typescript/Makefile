install-app:
	yarn set version berry
	yarn plugin import workspace-tools
	yarn config set nodeLinker node-modules
	yarn workspaces focus @hgraph/app

build-app:
	yarn workspaces foreach -tvp --include @hgraph/app --include @hgraph/precedent-iso run build
