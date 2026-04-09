export default async function (req: any, res: any) {
  try {
    const { default: app } = await import("../server/index.js");
    return app(req, res);
  } catch (err: any) {
    console.error("Critical Vercel Lambda Initialization Error:", err);
    res.status(500).json({
      error: "Server Initialization Failed",
      message: err.message,
      stack: err.stack
    });
  }
}
