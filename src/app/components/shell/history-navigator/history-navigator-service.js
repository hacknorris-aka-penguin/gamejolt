angular.module( 'App.Shell' ).service( 'HistoryNavigator', function( $window )
{
	this.canGoForward = true;
	this.canGoBack = true;

	this.back = function()
	{
		$window.history.back();
	};

	this.forward = function()
	{
		$window.history.forward();
	};


} );