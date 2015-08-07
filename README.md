# Ember-wildland-blueprints

This Ember Addon contains blueprints that follow as many of Wildlands Ember development/style/... conventions as possible.
The goal of this addon is to help our organization -- and possibly others -- increase productivity be reducing generation
boilerplate as much as possible.

## Requirements
* ember-cli-less or similar less ember preprocessor
* Existence of an `app/styles/app.less` file.

## Installation
`ember install ember-wildland-blueprints`

## Usage
`ember generate route ...`

Running the generator generates -- hopefully -- the same thing as the default ember-cli with the exception of adding
```
<div id="route-name-dasherized">
  {{outlet}}
</div>
```
To the route template instead of
```
{{outlet}}
```
As well as creating a .less file for the route and appending it to the app.less application stylesheet in the default order.

## Contributing

* `git clone` this repository
* `npm install`
* `bower install`
* Make changes
* Submit a PR

## Running Tests

* `ember test`
* `ember test --server`
* Manually test blueprint generator changes in a dummy ember app. Currently the best way to test these is likely by hand :/.

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
