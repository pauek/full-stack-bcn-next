type Props = {
  params: {
    partSlug: string;
    sessionSlug: string;
  };
};

export default async function Page({ params }: Props) {
  const { partSlug, sessionSlug } = params;
  return (
    <div>
      <h1>{partSlug}</h1>
      <h2>{sessionSlug}</h2>
    </div>
  );
}
