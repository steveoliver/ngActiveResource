angular
  .module('ngActiveResource')
  .factory('ARAssociatable.HasMany.Builder', ['ARAssociatable.HasMany', function(HasMany) {
    function Builder() {}

    Builder.build = function(klass, associationName, options) {
      var name    = associationName.pluralize().downcase(),
          options = _.isUndefined(options) ? {} : options;

      if (_.isUndefined(klass.associations.hasMany[name])) {
        return klass.associations.hasMany[name] = new HasMany(klass, name, options);
      }

      throw "Duplicate association " + name + " for " + klass.name;
    }

    return Builder;
  }])
  .factory('ARAssociatable.HasMany', ['$injector', function($injector) {
    function HasMany(klass, associationName, options) {
      this.klass = getClass();

      function getClass() {
        return options.provider ? $injector.get(options.provider) :
                                  $injector.get(guessClassName());
      }

      function guessClassName() {
        return associationName.classify();
      }

    }

    return HasMany;
  }]);