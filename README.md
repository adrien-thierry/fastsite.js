# fastsite.js

Fast, small and simple Single Page Application framework

# Install

* Just include fastsite.js or fastsite.min.js 
* Then, add attribute to your links : `app="myapp" app-view="#content"`

# Example

See example in `example` folder

# How it works

FastSite.js overides the onclick attribute of each `<a>` tag with `app=` property.

Then, it uses `history` html5 API and some tricks to conserve states of the app.

For example, if you load an content that erase a previous view, fastsite.js will make reload a snapshot to conserve the state of you view.


# TODO

* Add form