export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userId } = body;

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: '用户ID不能为空',
    });
  }

  // 模拟冻结用户逻辑
  console.log(`冻结用户: ${userId}`);

  return {
    code: 0,
    message: '用户冻结成功',
    data: null,
  };
});