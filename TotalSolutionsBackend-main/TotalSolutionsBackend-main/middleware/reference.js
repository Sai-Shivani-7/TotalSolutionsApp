async function generateUniqueReferenceId(Schema) {
  const { customAlphabet } = await import("nanoid");
  const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 10);
  let referenceId;
  let existingUser;
  do {
    referenceId = nanoid();
    existingUser = await Schema.findOne({ referenceId });
  } while (existingUser);
  return referenceId;
}

module.exports = { generateUniqueReferenceId };
