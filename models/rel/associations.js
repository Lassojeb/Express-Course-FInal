module.exports = function(models) {
    models.users.hasOne(models.posts, {
        foreignKey: "UserId"
    });
    models.posts.belongsTo(models.users, {
      foreignKey: "UserId"
    });
  };