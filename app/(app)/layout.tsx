import Navbar from "@/components/navbar";


interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
     <Navbar />
      {children}
    </>
  );
}