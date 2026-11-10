import { redirect } from "next/navigation";

// Do czasu podpięcia uwierzytelniania strona główna prowadzi do logowania.
export default function Home() {
  redirect("/login");
}
