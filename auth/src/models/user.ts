import mongoose, { Schema } from "mongoose";

// Interface that describes the properties that are required to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

// Interface that describes the properties that a User model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// Interface that describes the properties that a User instance has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
