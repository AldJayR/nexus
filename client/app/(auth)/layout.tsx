export default function AuthLayout({
  children,
  member,
  teamLead,
  adviser,
}: {
  children: React.ReactNode;
  member: React.ReactNode;
  teamLead: React.ReactNode;
  adviser: React.ReactNode;
}) {
  return (
    <>
      {children}
      {member}
      {teamLead}
      {adviser}
    </>
  );
}
