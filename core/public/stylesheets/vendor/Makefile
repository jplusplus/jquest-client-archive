
BOOTSTRAP_LESS = ./bootstrap/bootstrap.less
BOOTSTRAP = ./bootstrap-build/bootstrap.css
BOOTSTRAP_MIN = ./bootstrap-build/bootstrap.min.css


BOOTSTRAP_RESPONSIVE_LESS = ./bootstrap/responsive.less
BOOTSTRAP_RESPONSIVE = ./bootstrap-build/bootstrap-responsive.css
BOOTSTRAP_RESPONSIVE_MIN = ./bootstrap-build/bootstrap-responsive.min.css


DATE=$(shell date +%I:%M%p)
CHECK=\033[32m✔\033[39m


Built:	
	@echo "Building Bootstrap..."
	#@recess --compile ${BOOTSTRAP_LESS} > ${BOOTSTRAP}
	@recess --compile --compress ${BOOTSTRAP_LESS} > ${BOOTSTRAP_MIN}	
	#@recess --compile ${BOOTSTRAP_RESPONSIVE_LESS} > ${BOOTSTRAP_RESPONSIVE}
	@recess --compile --compress ${BOOTSTRAP_RESPONSIVE_LESS} > ${BOOTSTRAP_RESPONSIVE_MIN}	
	@echo "Compiling LESS with Recess...               ${CHECK} Done"

