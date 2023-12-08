interface Props {
  position: { x: number; y: number };
}

export default function ChatBox(props: Props) {
  const { position } = props;

  return (
    <div>
      <div
        style={{
          position: 'absolute',
          top: position.y,
          left: position.x,
          backgroundColor: '#FFFFFF',
        }}>
        <p>My Custom Menu</p>
      </div>
    </div>
  );
}

ChatBox.defaultProps = {
  position: { x: 0, y: 0 },
};
