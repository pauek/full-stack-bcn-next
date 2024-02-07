type _Props = {
  params: {
    course: string;
    part: string;
    session: string;
  };
};
export default function Loading({ params }: _Props) {
  return <div>Loading...</div>;
}
