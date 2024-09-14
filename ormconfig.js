module.exports = {
    type: "postgres",
    url: "postgresql://advtools_owner:80oKpwjSyHXT@ep-silent-scene-a5iex0dp.us-east-2.aws.neon.tech/advtools?sslmode=require",
    synchronize: true, 
    logging: false,
    entities: ["src/entities/**/*.js"],
    migrations: ["src/migrations/**/*.js"],
    subscribers: ["src/subscribers/**/*.js"],
    cli: {
      entitiesDir: "src/entities",
      migrationsDir: "src/migrations",
      subscribersDir: "src/subscribers"
    }
  };