// Nothing to construct
module.exports = function(){};

module.exports.merge = function(original, deflt) {
  for (var attr in deflt) {
    original[attr] = original[attr] || deflt[attr]
  }
  return original;
}