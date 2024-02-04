import { uploadAllFilesOfType } from "@/lib/data/images";
import { showExecutionTime } from "@/lib/utils";

showExecutionTime(async () => {
  await uploadAllFilesOfType("image");
  await uploadAllFilesOfType("slide");
  await uploadAllFilesOfType("cover");
});
