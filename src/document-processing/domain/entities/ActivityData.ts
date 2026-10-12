export interface ActivityDataProps {
  id: string;
  uploadId: string;
  rowNumber: number;
  category: string | null;
  amount: number | null;
  unit: string | null;
  date: Date | null;
  data: Record<string, string>;
  createdAt: Date;
}

export class ActivityData {
  constructor(private readonly props: ActivityDataProps) {}

  toObject(): ActivityDataProps {
    return { ...this.props, data: { ...this.props.data } };
  }
}
