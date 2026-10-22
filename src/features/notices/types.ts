export interface NoticeItem {
  id: string;
  referenceNo?: string | null;
  title: string;
  body: string;
  issuerName: string;
  issuerDesignation: string;
  copyTo: string[];
  createdAt: string;
}

export interface CreateNoticeInput {
  referenceNo?: string;
  title: string;
  body: string;
  issuerName: string;
  issuerDesignation: string;
  copyTo?: string[];
}

export interface UpdateNoticeInput {
  referenceNo?: string | null;
  title?: string;
  body?: string;
  issuerName?: string;
  issuerDesignation?: string;
  copyTo?: string[];
}
