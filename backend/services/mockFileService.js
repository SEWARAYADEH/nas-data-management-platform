function listMockFiles(path = "/") {
  return [
    {
      name: "Work",
      type: "folder",
      size: "-",
      path: "/Work",
      modifiedDate: "2026-05-09",
    },
    {
      name: "Design",
      type: "folder",
      size: "-",
      path: "/Design",
      modifiedDate: "2026-05-09",
    },
    {
      name: "final_final_v2.mp4",
      type: "video",
      size: "245 MB",
      path: `${path}/final_final_v2.mp4`,
      modifiedDate: "2026-05-08",
    },
  ];
}

module.exports = { listMockFiles };